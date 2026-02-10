const getGuestId = (req) =>
  (req.headers['x-guest-id'] || req.body?.guestId || req.query?.guestId || '')
    .toString()
    .trim();

module.exports = { getGuestId };
