import { useAtom } from "jotai";
import type { ChangeEvent, FC } from "react";
import { memo } from "react";
import { cellFamily } from "../../stores/cells";
import { Cell as CellPresenter } from "../components";

type Props = {
  row: number;
  col: number;
};

export const CellContainer: FC<Props> = memo(({ row, col }) => {
  const [value, setValue] = useAtom(cellFamily({ row, col }));

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return <CellPresenter value={value} onChange={handleChange} />;
});

CellContainer.displayName = "CellContainer";
