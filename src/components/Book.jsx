import { pages } from "./UI";
import { Page } from "./Page";
export const Book = ({ ...props }) => {
  return (
    <group {...props}>
      {[...pages].map((pageData, index) => (
        <Page key={index} number={index} {...props} />
      ))}
    </group>
  );
};
