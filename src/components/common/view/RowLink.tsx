import type { ReactNode } from "react";
import { Link } from "react-aria-components";
import { cn } from "@/utils/cn.utils";
import { rowLink } from "../../../styles/view/rowLink.styles";

type IProps = {
  href: string;
  // Runs before the navigation, e.g. to close the modal the row sits in.
  onPress?: () => void;
  className?: string;
  children: ReactNode;
};

// The row's text, linked; its tap area covers the whole row (the row must be positioned).
const RowLink = ({ href, onPress, className, children }: IProps) => (
  <Link href={href} onPress={onPress} className={cn(rowLink, className)}>
    {children}
  </Link>
);

export default RowLink;
