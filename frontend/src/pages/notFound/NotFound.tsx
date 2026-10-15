import React from "react";
import styled from "styled-components";

import usePageTitle from "../../hooks/usePageTitle";
import { colors } from "../../styles/theme";
import { ButtonLink } from "../../components/ui/Button";

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 1rem;
  text-align: center;
`;

const Code = styled.p`
  background: linear-gradient(135deg, ${colors.primary} 0%, #c86bff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 7rem;
  font-weight: 800;
  line-height: 1;
`;

const Title = styled.h1`
  font-size: 1.75rem;
`;

const Text = styled.p`
  max-width: 28rem;
  color: ${colors.textMuted};
  line-height: 1.6;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const NotFound = () => {
  usePageTitle("Page not found");

  return (
    <Wrapper aria-labelledby="not-found-title">
      <Code aria-hidden>404</Code>
      <Title id="not-found-title">This level doesn&apos;t exist</Title>
      <Text>
        The page you&apos;re looking for has moved or never existed. Let&apos;s
        get you back in the game.
      </Text>
      <Actions>
        <ButtonLink to="/">Back to the store</ButtonLink>
        <ButtonLink to="/catalog" $variant="secondary">
          Browse the catalog
        </ButtonLink>
      </Actions>
    </Wrapper>
  );
};

export default NotFound;
