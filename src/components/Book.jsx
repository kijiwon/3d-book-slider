import { pages } from "./UI";
import { Page } from "./Page";
export const Book = ({ ...props }) => {
  return (
    <group {...props}>
      {[...pages].map((pageData, index) =>
        index === 0 ? ( // 첫 번째 페이지만 렌더링
          <Page
            position-x={index * 0.15}
            key={index}
            number={index}
            {...pageData}
          />
        ) : null
      )}
    </group>
  );
};
