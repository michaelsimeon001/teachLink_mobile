# Security

This document outlines security procedures and best practices for the TeachLink mobile application.

## SSL Pinning

The TeachLink mobile app uses SSL pinning to ensure that it only communicates with trusted servers. This helps to prevent man-in-the-middle attacks.

### Certificate Pin Rotation

To maintain a high level of security, the SSL pins should be rotated periodically. The following steps outline the process for rotating the certificate pins:

1.  **Generate a new key and certificate signing request (CSR).**

    ```bash
    openssl req -new -newkey rsa:2048 -nodes -keyout new.key -out new.csr
    ```

2.  **Get the new certificate signed by the Certificate Authority (CA).**

3.  **Extract the SPKI hash from the new certificate.**

    ```bash
    openssl x509 -in new.crt -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
    ```

4.  **Update `app.json` with the new pins.**

    *   The new pin will become the `primaryPin`.
    *   The old `primaryPin` will become the `backupPin`.

5.  **Deploy the new certificate to the server.**

6.  **Deploy the updated app to the app stores.**

### Current Pins

*   **Primary Pin:** `ro9iqKFUc1QlFywktB2QYqziDuEeV8NSFiHZhy75qi4=`
*   **Backup Pin:** `C5+lpZ7tcV/weqBHvLr2K8k2y2cnq6/s3tT4G/cM9dY=`