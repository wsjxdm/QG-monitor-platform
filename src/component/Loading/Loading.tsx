import React from "react";
import styles from "./Loading.module.css";

const Loading: React.FC = () => {
  return (
    <div className={styles.container} aria-live="polite">
      <div className={styles.spinner} />
      <div className={styles.text}>加载中...</div>
    </div>
  );
};

export default Loading;
