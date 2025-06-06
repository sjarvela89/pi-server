const jwt = require('jsonwebtoken');

function TokenService(config) {
  this.jwtConfig = config.Jwt;

  if (
    !this.jwtConfig ||
    !this.jwtConfig.Key ||
    !this.jwtConfig.Issuer ||
    !this.jwtConfig.Audience
  ) {
    throw new Error('JWT configuration is incomplete');
  }
}

TokenService.prototype.generateToken = function (username, role) {
  const payload = {
    name: username,
    role: role
  };

  const options = {
    issuer: this.jwtConfig.Issuer,
    audience: this.jwtConfig.Audience,
    expiresIn: this.jwtConfig.ExpireMinutes + 'm'
  };
  console.log('options are: ',options);
  console.log('returningn jwt sign.');
  console.log('JWT config: ', this.jwtConfig);
  console.log('typeof key:', typeof this.jwtConfig.Key);
  try{
  const sign = jwt.sign(payload, this.jwtConfig.Key, options);
  console.log('sign was: ', sign);
  return sign;
  }catch (err){
    console.error('JWT signing failed:', err);
    throw err;
  }
};

module.exports = {
  TokenService
};