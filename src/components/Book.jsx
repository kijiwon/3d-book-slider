import { pageAtom, pages } from "./UI";
import { Page } from "./Page";
import { useAtom } from "jotai";
export const Book = ({ ...props }) => {
  const [page] = useAtom(pageAtom);
  return (
    <group {...props}>
      {[...pages].map((pageData, index) => (
        <Page key={index} page={page} number={index} {...pageData} />
      ))}
    </group>
  );
};
