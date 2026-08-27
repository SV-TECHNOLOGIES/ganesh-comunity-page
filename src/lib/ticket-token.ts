import crypto from 'crypto';

const TICKET_SECRET = process.env.JWT_SECRET || 'ukta-secure-ticket-salt-2026';

/**
 * Creates an unguessable, cryptographically signed hash token for a given payment ID.
 * Example: 'tkt_cGF5LTIwMg_8f3a9b1c7d2e4f5a'
 */
export function generateTicketToken(paymentId: string): string {
  if (!paymentId) return '';
  const hmac = crypto
    .createHmac('sha256', TICKET_SECRET)
    .update(paymentId)
    .digest('hex')
    .slice(0, 16);
  const encodedId = Buffer.from(paymentId, 'utf-8').toString('base64url');
  return `tkt_${encodedId}_${hmac}`;
}

/**
 * Resolves a ticket token back to the original payment ID.
 * Verifies HMAC integrity so arbitrary/guessed tokens are rejected.
 */
export function resolveTicketId(tokenOrId: string): string | null {
  if (!tokenOrId) return null;

  if (tokenOrId.startsWith('tkt_')) {
    const parts = tokenOrId.slice(4).split('_');
    if (parts.length === 2) {
      const [encodedId, hmac] = parts;
      try {
        const paymentId = Buffer.from(encodedId, 'base64url').toString('utf-8');
        const expectedHmac = crypto
          .createHmac('sha256', TICKET_SECRET)
          .update(paymentId)
          .digest('hex')
          .slice(0, 16);

        if (hmac === expectedHmac) {
          return paymentId;
        }
      } catch {
        return null;
      }
    }
    return null;
  }

  // Fallback to allow legacy raw IDs if directly passed
  return tokenOrId;
}
