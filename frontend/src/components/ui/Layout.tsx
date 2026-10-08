import React from "react";
import styled from "styled-components";

import { colors, radii } from "../../styles/theme";

const HeaderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  line-height: 1.25;
`;

const Subtitle = styled.p`
  margin-top: 0.375rem;
  color: ${colors.textMuted};
  line-height: 1.5;
`;

type PageHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
};

export const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => (
  <HeaderRow>
    <div>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </div>
    {actions}
  </HeaderRow>
);

export const Panel = styled.section`
  background: ${colors.surface};
  border-radius: ${radii.md};
  padding: 1.5rem;
`;

export const PanelTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1.25rem;
`;

export const Muted = styled.span`
  color: ${colors.textMuted};
`;
