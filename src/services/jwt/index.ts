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
  return jwt.sign({ ...data }, process.env.JWT_SECRET, { expiresIn: "1m" });
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

async function refreshToken(token: string) {
  const decodedToken: any = jwt.decode(token);

  if (!decodedToken) {
    throw new Error("Invalid token");
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);

  let time = new Date(decodedToken.exp * 1000).toLocaleString("th", {
    hour12: false,
  });

  let expireIn = "Token expire in " + time;

  if (decodedToken.exp > currentTimestamp)
    return {
      token,
      expireIn,
      msg: "You can use this token!",
      isExpire: false,
    };

  delete decodedToken.iat;
  delete decodedToken.exp;

  const newToken = await getToken(decodedToken);
  return {
    token,
    newToken,
    expireIn,
    msg: "Refresh token success!",
    isExpire: true,
  };
}

function isTokenExpired(token: string): boolean {
  // Decode the token to get the payload
  const decodedToken: any = jwt.decode(token);

  if (!decodedToken) {
    throw new Error("Invalid token");
  }

  // Check if the token has expired
  const currentTimestamp = Math.floor(Date.now() / 1000);
  return decodedToken.exp < currentTimestamp;
}
export default {
  verifyToken,
  getToken,
  guardAuth,
  refreshToken,
  isTokenExpired,
};
