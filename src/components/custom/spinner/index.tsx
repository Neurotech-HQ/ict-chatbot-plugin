import type { CSSProperties } from "react";
import styles from "./spinner.module.css";

const Spinner = ({ size, color }: { size?: number; color?: string }) => {
  return (
    <span
      className={styles.loader}
      style={
        {
          "--loader-size": `${size || 40}px`,
          ...(color ? { "--loader-color": color, color } : {}),
        } as CSSProperties
      }
    />
  );
};

export default Spinner;
