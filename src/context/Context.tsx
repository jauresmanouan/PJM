import { createContext } from "react";

export default createContext({
  isClicked: false,
  setIsClicked: () => {},
  handleClicked: () => {},
  isClosedForm: false,
  setIsClosedForm: () => {},
  name: "name",
  setName: () => {},
  quantity: 0,
  setQuantity: () => {},
} as {
  isClicked: boolean;
  isClosedForm: boolean;
  setIsClicked: (value: boolean) => void;
  setIsClosedForm: (value: boolean) => void;
  handleClicked: () => void;
  name: string;
  setName: (value: string) => void;
  quantity: number;
  setQuantity: (value: number) => void;
});
