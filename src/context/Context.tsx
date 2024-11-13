import { createContext } from "react";

export default createContext({
  isClicked: false,
  setIsClicked: () => {},
  handleClicked: () => {},
  isClosedForm: false,
  setIsClosedForm: () => {},
} as {
  isClicked: boolean;
  isClosedForm: boolean;
  setIsClicked: (value: boolean) => void;
  setIsClosedForm: (value: boolean) => void;
  handleClicked: () => void;
});
