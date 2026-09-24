import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type IProps = {
  src?: string | null;
  alt: string;
  // Shown while the image loads and when there is none, e.g. initials or an icon.
  fallback: ReactNode;
  size?: "default" | "sm" | "lg";
  className?: string;
};

const AppAvatar = ({ src, alt, fallback, size, className }: IProps) => {
  return (
    <Avatar size={size} className={className}>
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
};

export default AppAvatar;
