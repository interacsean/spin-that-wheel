import { useEffect, useRef } from "react";

export const useWhatsChanged = (props: Record<string, unknown>, prefix = '') => {
    const prevProps = useRef(props);
  
    useEffect(() => {
      Object.entries(props).forEach(([key, value]) => {
        if (
          !Object.prototype.hasOwnProperty.call(prevProps.current, key) ||
          prevProps.current[key] !== value
        ) {
          // eslint-disable-next-line no-console
          console.log(`${prefix} ${key} has changed ${value}`);
        }
      });
  
      prevProps.current = props;
    }, [props, prefix]);
  };
  