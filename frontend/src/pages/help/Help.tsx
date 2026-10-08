import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { FiChevronDown } from "react-icons/fi";

import { colors, radii } from "../../styles/theme";
import { PageHeader, Panel, PanelTitle } from "../../components/ui/Layout";

const Faq = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const Item = styled.details`
  border-radius: ${radii.md};
  background: ${colors.surface};

  summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.125rem 1.5rem;
    font-size: 1.0625rem;
    font-weight: 600;
    cursor: pointer;
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }

    svg {
      flex-shrink: 0;
      transition: transform 150ms ease-in;
    }
  }

  &[open] summary svg {
    transform: rotate(180deg);
  }

  p {
    padding: 0 1.5rem 1.25rem;
    color: ${colors.textSoft};
    line-height: 1.7;
  }

  a {
    color: ${colors.primary};
  }
`;

const Contact = styled.p`
  color: ${colors.textSoft};
  line-height: 1.7;

  a {
    color: ${colors.primary};
  }
`;

const QUESTIONS: { question: string; answer: React.ReactNode }[] = [
  {
    question: "How do I place an order?",
    answer: (
      <>
        Add products to your cart, open the <Link to="/cart">cart page</Link>{" "}
        and press <strong>Pay</strong>. You need to be signed in, and the order
        is paid from your store balance.
      </>
    ),
  },
  {
    question: "How does the store balance work?",
    answer: (
      <>
        Your balance is store credit used at checkout. You can add funds at any
        time on the <Link to="/balance">Balance page</Link>, where every top-up
        and purchase is listed. This demo store never takes a real payment.
      </>
    ),
  },
  {
    question: "When will I receive my order?",
    answer:
      "Hardware ships within 2 working days and delivery is free nationwide. Games are digital keys and appear in your order confirmation straight away.",
  },
  {
    question: "Can I return a product?",
    answer: (
      <>
        Unopened hardware can be returned within 14 days of delivery for a
        refund to your store balance. Digital keys can&apos;t be returned once
        revealed. See our <Link to="/conditions">terms and conditions</Link> for
        details.
      </>
    ),
  },
  {
    question: "How do favorites work?",
    answer: (
      <>
        Tap the heart on any product to save it. Your saved products are on the{" "}
        <Link to="/favorite">Favorites page</Link> and stay with your account
        across devices.
      </>
    ),
  },
  {
    question: "I forgot my password. What can I do?",
    answer:
      "Password resets aren't available in this demo yet. Create a new account, or contact support and we'll help you get back in.",
  },
];

const Help = () => (
  <>
    <PageHeader
      title="Help center"
      subtitle="Answers to the questions we hear most often."
    />
    <Faq>
      {QUESTIONS.map(({ question, answer }) => (
        <Item key={question}>
          <summary>
            {question}
            <FiChevronDown aria-hidden />
          </summary>
          <p>{answer}</p>
        </Item>
      ))}
    </Faq>
    <Panel aria-labelledby="contact-title">
      <PanelTitle id="contact-title">Still need help?</PanelTitle>
      <Contact>
        Email us at <a href="mailto:support@example.com">support@example.com</a>{" "}
        and we&apos;ll get back to you within one working day.
      </Contact>
    </Panel>
  </>
);

export default Help;
