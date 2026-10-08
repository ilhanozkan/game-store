import React from "react";

import { ButtonLink } from "../ui/Button";

const CatalogButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <ButtonLink to="/catalog" onClick={onClick}>
      Go to catalog
    </ButtonLink>
  );
};

export default CatalogButton;
