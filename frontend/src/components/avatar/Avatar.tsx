import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { colors } from "../../styles/theme";

const Image = styled.img<{ $size: number }>`
  width: ${({ $size }) => $size}rem;
  height: ${({ $size }) => $size}rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const Initials = styled.span<{ $size: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => $size}rem;
  height: ${({ $size }) => $size}rem;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${colors.primarySoft};
  color: ${colors.primary};
  font-size: ${({ $size }) => $size * 0.38}rem;
  font-weight: 700;
`;

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

type AvatarProps = {
  name: string;
  src?: string | null;
  size?: number;
};

// Shows the user's photo, falling back to their initials.
const Avatar = ({ name, src, size = 2.75 }: AvatarProps) => {
  const [failed, setFailed] = useState(false);

  // Give a new image URL a fresh chance to load.
  useEffect(() => setFailed(false), [src]);

  if (src && !failed) {
    return (
      <Image src={src} alt="" $size={size} onError={() => setFailed(true)} />
    );
  }
  return (
    <Initials $size={size} aria-hidden>
      {getInitials(name) || "?"}
    </Initials>
  );
};

export default Avatar;
