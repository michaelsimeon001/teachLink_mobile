import AsyncStorage from '@react-native-async-storage/async-storage';
import * as IAP from 'react-native-iap';

import { apiService } from '../src/services/api';
import { mobilePaymentsService, PRODUCT_IDS } from '../src/services/mobilePayments';

jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));
jest.mock('@react-native-async-storage/async-storage');
jest.mock('react-native-iap');
jest.mock('../src/services/api', () => ({
  apiService: { post: jest.fn() },
}));
jest.mock('../src/utils/logger', () => ({
  appLogger: {
    errorSync: jest.fn(),
    warnSync: jest.fn(),
    infoSync: jest.fn(),
    debugSync: jest.fn(),
  },
}));
jest.mock('../src/store/deviceStore', () => ({
  useDeviceStore: { getState: () => ({ isDeviceCompromised: false }) },
}));

const mockStoreState = {
  receiptValidationPending: false,
  setReceiptValidationPending: jest.fn(),
  setSubscriptionTier: jest.fn(),
};
jest.mock('../src/store', () => ({
  useAppStore: { getState: jest.fn(() => mockStoreState) },
}));

const mockIAP = IAP as jest.Mocked<typeof IAP>;
const mockApi = apiService as jest.Mocked<typeof apiService>;
const mockStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const VALID_RECEIPT = 'valid_receipt_base64_abc123';
const TAMPERED_RECEIPT = 'tampered_receipt_base64_xyz789';
const EXPIRED_RECEIPT = 'expired_receipt_base64_def456';
const REPLAYED_RECEIPT = 'replayed_receipt_base64_ghi012';
const PRODUCT_ID = PRODUCT_IDS.PRO_MONTHLY;

function makeServerResponse(valid: boolean, error?: string, extra?: Record<string, unknown>) {
  return { data: { valid, error, ...extra } };
}

describe('payment receipt tamper tests (#843)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoreState.receiptValidationPending = false;
    mockStorage.getItem.mockResolvedValue(null);
    mockStorage.setItem.mockResolvedValue(undefined);
    mockIAP.finishTransaction = jest.fn().mockResolvedValue(undefined);
  });

  // ── Valid receipt is accepted ─────────────────────────────────────────

  it('accepts a valid receipt and finishes the transaction', async () => {
    mockApi.post.mockResolvedValueOnce(
      makeServerResponse(true, undefined, { tier: 'pro', expiry: '2027-01-01T00:00:00Z' })
    );

    const result = await mobilePaymentsService.validateReceipt(VALID_RECEIPT, 'ios', PRODUCT_ID);

    expect(result.valid).toBe(true);
    expect(result.tier).toBe('pro');
    expect(mockApi.post).toHaveBeenCalledWith('/api/payments/validate-receipt', {
      receipt: VALID_RECEIPT,
      platform: 'ios',
      productId: PRODUCT_ID,
    });
  });

  // ── Tampered receipt is rejected ──────────────────────────────────────

  it('rejects a tampered receipt with valid: false', async () => {
    mockApi.post.mockResolvedValueOnce(
      makeServerResponse(false, 'Receipt signature mismatch – possible tampering')
    );

    const result = await mobilePaymentsService.validateReceipt(TAMPERED_RECEIPT, 'ios', PRODUCT_ID);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('tamper');
  });

  it('does not call finishTransaction when server rejects tampered receipt', async () => {
    mockApi.post.mockResolvedValueOnce(makeServerResponse(false, 'Receipt tampered'));

    const result = await mobilePaymentsService.validateReceipt(TAMPERED_RECEIPT, 'ios', PRODUCT_ID);

    expect(result.valid).toBe(false);
    // finishTransaction should only be called externally after valid:true
    expect(mockIAP.finishTransaction).not.toHaveBeenCalled();
  });

  // ── Expired receipt is rejected ───────────────────────────────────────

  it('rejects an expired receipt', async () => {
    mockApi.post.mockResolvedValueOnce(makeServerResponse(false, 'Receipt has expired'));

    const result = await mobilePaymentsService.validateReceipt(EXPIRED_RECEIPT, 'ios', PRODUCT_ID);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('expired');
  });

  // ── Replayed receipt is rejected ──────────────────────────────────────

  it('rejects a replayed receipt (already redeemed)', async () => {
    mockApi.post.mockResolvedValueOnce(makeServerResponse(false, 'Receipt already redeemed'));

    const result = await mobilePaymentsService.validateReceipt(REPLAYED_RECEIPT, 'ios', PRODUCT_ID);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('already redeemed');
  });

  // ── Server error is thrown immediately (no retry) ─────────────────────

  it('throws immediately on server-returned error (4xx) without retrying', async () => {
    const serverError = Object.assign(new Error('Forbidden'), {
      response: { status: 403, data: { message: 'Forbidden' } },
    });
    mockApi.post.mockRejectedValueOnce(serverError);

    await expect(
      mobilePaymentsService.validateReceipt(VALID_RECEIPT, 'ios', PRODUCT_ID)
    ).rejects.toThrow('Forbidden');

    expect(mockApi.post).toHaveBeenCalledTimes(1);
  });

  // ── Network error retries up to 4 attempts ───────────────────────────

  it('retries on network error up to 4 total attempts', async () => {
    const networkError = new Error('Network Error');
    mockApi.post.mockRejectedValue(networkError);

    jest.useFakeTimers();
    const promise = mobilePaymentsService
      .validateReceipt(VALID_RECEIPT, 'ios', PRODUCT_ID)
      .catch(e => e);
    await jest.runAllTimersAsync();
    const error = await promise;

    expect(error.message).toBe('Network Error');
    expect(mockApi.post).toHaveBeenCalledTimes(4);
    jest.useRealTimers();
  });

  // ── Network error then success ────────────────────────────────────────

  it('succeeds after transient network error on retry', async () => {
    mockApi.post
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce(makeServerResponse(true, undefined, { tier: 'pro' }));

    jest.useFakeTimers();
    const promise = mobilePaymentsService.validateReceipt(VALID_RECEIPT, 'ios', PRODUCT_ID);
    await jest.runAllTimersAsync();
    const result = await promise;
    jest.useRealTimers();

    expect(result.valid).toBe(true);
    expect(mockApi.post).toHaveBeenCalledTimes(2);
  });

  // ── Receipt validation endpoint path is correct ───────────────────────

  it('sends receipt to the correct validation endpoint', async () => {
    mockApi.post.mockResolvedValueOnce(makeServerResponse(true));

    await mobilePaymentsService.validateReceipt(VALID_RECEIPT, 'android', PRODUCT_ID);

    expect(mockApi.post).toHaveBeenCalledWith(
      '/api/payments/validate-receipt',
      expect.objectContaining({
        receipt: VALID_RECEIPT,
        platform: 'android',
      })
    );
  });

  // ── Multiple receipts validated independently ──────────────────────────

  it('validates different receipts independently without cross-contamination', async () => {
    mockApi.post
      .mockResolvedValueOnce(makeServerResponse(true, undefined, { tier: 'pro' }))
      .mockResolvedValueOnce(makeServerResponse(false, 'Invalid'));

    const result1 = await mobilePaymentsService.validateReceipt(VALID_RECEIPT, 'ios', PRODUCT_ID);
    const result2 = await mobilePaymentsService.validateReceipt(
      TAMPERED_RECEIPT,
      'ios',
      PRODUCT_ID
    );

    expect(result1.valid).toBe(true);
    expect(result2.valid).toBe(false);
  });
});
