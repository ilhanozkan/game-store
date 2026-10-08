import React from "react";
import styled from "styled-components";

import { colors } from "../../styles/theme";
import { PageHeader, Panel } from "../../components/ui/Layout";
import usePageTitle from "../../hooks/usePageTitle";

const Article = styled(Panel)`
  max-width: 52rem;

  h2 {
    margin: 2rem 0 0.75rem;
    font-size: 1.25rem;

    &:first-child {
      margin-top: 0;
    }
  }

  p,
  li {
    color: ${colors.textSoft};
    line-height: 1.7;
  }

  ul {
    padding-left: 1.25rem;
  }
`;

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. About these terms",
    body: [
      "These terms apply whenever you browse or buy from Game Drill. By creating an account or placing an order you agree to them.",
    ],
  },
  {
    title: "2. Your account",
    body: [
      "Keep your password private and let us know straight away if you think someone else has used your account.",
      "You must provide accurate details, and you are responsible for orders placed from your account.",
    ],
  },
  {
    title: "3. Prices and payment",
    body: [
      "Prices are shown in Nigerian Naira (₦) and include VAT. Orders are paid from your store balance at checkout.",
      "Store balance has no cash value and can't be transferred to another account.",
    ],
  },
  {
    title: "4. Stock and orders",
    body: [
      "Products are reserved for you only when your order is confirmed. If an item sells out before then, we'll let you know at checkout and you won't be charged for it.",
    ],
  },
  {
    title: "5. Delivery",
    body: [
      "Hardware ships within 2 working days with free delivery. Digital game keys are delivered instantly with your order confirmation.",
    ],
  },
  {
    title: "6. Returns and refunds",
    body: [
      "Unopened hardware can be returned within 14 days of delivery. Faulty items are covered by the manufacturer's warranty.",
      "Refunds are credited to your store balance. Digital keys can't be returned once revealed.",
    ],
  },
  {
    title: "7. Privacy",
    body: [
      "We store only the details needed to run your account and orders. Passwords are encrypted and never visible to our staff.",
    ],
  },
];

const Conditions = () => {
  usePageTitle("Terms & conditions");

  return (
    <>
      <PageHeader
        title="Terms & conditions"
        subtitle="Last updated 8 October 2026"
      />
      <Article as="article">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </Article>
    </>
  );
};

export default Conditions;
