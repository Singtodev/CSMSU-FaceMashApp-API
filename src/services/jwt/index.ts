const jwt = require("jsonwebtoken");

function verifyToken(token: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

function getToken(data: any) {
  return jwt.sign({ ...data }, process.env.JWT_SECRET, { expiresIn: "10m" });
}

async function guardAuth(req: any, res: any) {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) return { status: false, msg: "Token not found" };
  try {
    let decoded: any = await verifyToken(token);
    return {
      status: true,
      data: decoded,
      msg: "Token valid",
    };
  } catch (error: any) {
    return { status: false, msg: error.message };
  }
}

export default {
  verifyToken,
  getToken,
  guardAuth,
};
