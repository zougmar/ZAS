// Lightweight ping – no backend load, so no cold-start 504
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', req.headers?.origin || '*');
  res.status(200).json({
    ok: true,
    message: 'Deployment works',
    status: 'API is reachable',
  });
}
