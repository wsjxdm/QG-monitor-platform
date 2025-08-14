//处理返回一堆数字想要x轴加上时间的场景
// 处理时间数据的函数
const processTimeData = (values: number[], type: string) => {
  const now = new Date();
  const result = [];

  switch (type) {
    case "day":
      // 24小时数据，从当前小时开始往前推
      for (let i = 0; i < values.length; i++) {
        const hour = new Date(now);
        hour.setHours(now.getHours() - i);
        result.unshift({
          time:
            hour.toISOString().split("T")[0] +
            " " +
            hour.getHours().toString().padStart(2, "0") +
            ":00",
          value: values[i],
        });
      }
      break;

    case "week":
      // 7天数据，从今天开始往前推
      for (let i = 0; i < values.length; i++) {
        const day = new Date(now);
        day.setDate(now.getDate() - i);
        result.unshift({
          time: day.toISOString().split("T")[0],
          value: values[i],
        });
      }
      break;

    case "month":
      // 30天数据，从今天开始往前推
      for (let i = 0; i < values.length; i++) {
        const day = new Date(now);
        day.setDate(now.getDate() - i);
        result.unshift({
          time: day.toISOString().split("T")[0],
          value: values[i],
        });
      }
      break;

    default:
      // 默认按天处理
      for (let i = 0; i < values.length; i++) {
        const hour = new Date(now);
        hour.setHours(now.getHours() - i);
        result.unshift({
          time:
            hour.toISOString().split("T")[0] +
            " " +
            hour.getHours().toString().padStart(2, "0") +
            ":00",
          value: values[i],
        });
      }
  }

  return result;
};

export default processTimeData;
