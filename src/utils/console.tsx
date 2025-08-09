import { message } from "antd";

const originalConsole = { ...console };

function containSensitiveInfo(arg: any[]) {
  const sensitiveWords = [
    "password",
    "token",
    "cookie",
    "credit card",
    "social security number",
    "bank account number",
    "credit card number",
    "phone number",
    "email",
    "username",
    "password",
    "secret",
    "api key",
    "api token",
  ];
  const argString = JSON.stringify(arg).toLowerCase();
  return sensitiveWords.some((word) => argString.includes(word));
}

function variableContainsSensitiveInfo(arg: any): boolean {
  if (typeof arg !== "function") return false;
  const funStr = arg.toString();
  return containSensitiveInfo(funStr);
}

//如果用户打印的内容中包含敏感信息，则不打印该日志
Object.keys(originalConsole).forEach((key) => {
  console[key] = (...arg: any[]) => {
    if (containSensitiveInfo(arg)) {
      //如果包含敏感信息，则不打印，并告警
      message.warning("检测到敏感信息，已阻止打印");
      console.warn("检测到敏感信息，已阻止打印");
      return;
    }
    if (variableContainsSensitiveInfo(key)) {
      message.warning("检测到敏感信息，已阻止打印");
      console.warn("检测到敏感信息，已阻止打印");
      return;
    }
    originalConsole[key](...arg);
  };
});

export default console;
