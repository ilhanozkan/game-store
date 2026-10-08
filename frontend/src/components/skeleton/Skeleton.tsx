import React from "react";
import styled, { keyframes } from "styled-components";

import { colors, radii } from "../../styles/theme";

const shimmer = keyframes`
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
`;

export const Bone = styled.span<{
  $width?: string;
  $height?: string;
  $round?: boolean;
}>`
  display: block;
  width: ${({ $width = "100%" }) => $width};
  height: ${({ $height = "1rem" }) => $height};
  border-radius: ${({ $round }) => ($round ? radii.pill : radii.sm)};
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06) 25%,
    rgba(255, 255, 255, 0.12) 37%,
    rgba(255, 255, 255, 0.06) 63%
  );
  background-size: 400% 100%;
  animation: ${shimmer} 1.4s ease infinite;
`;

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16.5rem, 1fr));
  gap: 4rem 1.75rem;
  padding-top: 2.5rem;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1rem 1.5rem;
  border-radius: 0.42125rem;
  background: ${colors.surface};
`;

const ImageBone = styled(Bone)`
  margin-top: -2.5rem;
  margin-bottom: 1rem;
`;

type LoadingProps = { label?: string };

export const ProductGridSkeleton = ({
  count = 8,
  label = "Loading products",
}: LoadingProps & { count?: number }) => (
  <Grid role="status" aria-busy="true">
    <VisuallyHidden>{label}</VisuallyHidden>
    {Array.from({ length: count }, (_, index) => (
      <Card key={index} aria-hidden>
        <ImageBone $width="70%" $height="11.25rem" />
        <Bone $width="60%" $height="1.25rem" />
        <Bone $width="40%" />
        <Bone $width="50%" />
        <Bone $width="35%" $height="1.25rem" />
        <Bone $width="45%" $height="2.125rem" $round />
      </Card>
    ))}
  </Grid>
);

const Detail = styled.div`
  display: grid;
  margin-top: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: 2.5rem;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const ProductDetailSkeleton = ({
  label = "Loading product",
}: LoadingProps) => (
  <div role="status" aria-busy="true">
    <VisuallyHidden>{label}</VisuallyHidden>
    <Bone $width="14rem" $height="1rem" />
    <Detail aria-hidden>
      <Bone $height="22rem" />
      <Column>
        <Bone $width="35%" />
        <Bone $width="80%" $height="2.25rem" />
        <Bone $width="30%" />
        <Bone $width="40%" $height="2rem" />
        <Bone $height="4.5rem" />
        <Bone $width="60%" $height="3rem" $round />
      </Column>
    </Detail>
  </div>
);

const Tiles = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 1.5rem;
`;

const Tile = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 1.5rem;
  border-radius: ${radii.md};
  background: ${colors.surface};
`;

export const TileGridSkeleton = ({
  count = 6,
  label = "Loading",
}: LoadingProps & { count?: number }) => (
  <Tiles role="status" aria-busy="true">
    <VisuallyHidden>{label}</VisuallyHidden>
    {Array.from({ length: count }, (_, index) => (
      <Tile key={index} aria-hidden>
        <Bone $width="3rem" $height="3rem" />
        <Bone $width="60%" $height="1.25rem" />
        <Bone $height="2.75rem" />
        <Bone $width="40%" />
      </Tile>
    ))}
  </Tiles>
);
