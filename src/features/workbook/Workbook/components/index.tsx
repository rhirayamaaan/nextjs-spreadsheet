import type { FC, ReactNode } from "react";

type WorkbookPresenterProps = {
  tabs: ReactNode;
  sheet: ReactNode;
};

export const WorkbookPresenter: FC<WorkbookPresenterProps> = ({
  tabs,
  sheet,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#ffffff",
        overflow: "hidden",
      }}
    >
      {tabs}
      <div style={{ flex: 1, overflow: "hidden" }}>{sheet}</div>
    </div>
  );
};
