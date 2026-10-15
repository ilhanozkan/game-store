import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@apollo/client";
import { FiArrowRight } from "react-icons/fi";

import { CATEGORIES_QUERY } from "../../queries/Queries";
import { CategoriesData } from "../../types/Types";
import { getErrorMessage } from "../../utils/apolloErrors";
import { colors, radii } from "../../styles/theme";
import usePageTitle from "../../hooks/usePageTitle";
import { TileGridSkeleton } from "../../components/skeleton/Skeleton";
import IconSwitcher from "../../components/iconSwitcher/IconSwitcher";
import { PageHeader } from "../../components/ui/Layout";
import { ErrorState } from "../../components/ui/States";

const Grid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 1.5rem;
  list-style: none;
`;

const Tile = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
  padding: 1.5rem;
  border-radius: ${radii.md};
  background: ${colors.surface};
  color: #fff;
  text-decoration: none;
  transition: outline 30ms ease-in, transform 150ms ease-in;

  &:hover {
    outline: 0.2rem solid rgba(255, 255, 255, 0.5);
  }
`;

const Icon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: ${radii.md};
  background: ${colors.primarySoft};
  color: ${colors.primary};
  font-size: 1.5rem;
`;

const Name = styled.h2`
  font-size: 1.25rem;
`;

const Description = styled.p`
  flex: 1;
  color: ${colors.textMuted};
  line-height: 1.5;
`;

const Footer = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${colors.textSoft};
  font-size: 0.9375rem;
`;

const Catalog = () => {
  usePageTitle("Catalog");
  const { data, loading, error, refetch } =
    useQuery<CategoriesData>(CATEGORIES_QUERY);

  let content;
  if (loading && !data) {
    content = <TileGridSkeleton count={7} label="Loading categories" />;
  } else if (error && !data) {
    content = (
      <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
    );
  } else {
    content = (
      <Grid>
        {data?.categories.map((category) => (
          <li key={category.slug}>
            <Tile to={`/products/${category.slug}`}>
              <Icon>
                <IconSwitcher name={category.slug} />
              </Icon>
              <Name>{category.name}</Name>
              <Description>{category.description}</Description>
              <Footer>
                {category.productCount} product
                {category.productCount === 1 ? "" : "s"}
                <FiArrowRight aria-hidden />
              </Footer>
            </Tile>
          </li>
        ))}
      </Grid>
    );
  }

  return (
    <>
      <PageHeader
        title="Catalog"
        subtitle="Everything we stock, grouped by category."
      />
      {content}
    </>
  );
};

export default Catalog;
