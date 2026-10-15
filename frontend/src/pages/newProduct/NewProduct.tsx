import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useMutation, useQuery } from "@apollo/client";
import { FiPlus, FiTrash2 } from "react-icons/fi";

import { CATEGORIES_QUERY } from "../../queries/Queries";
import { CREATE_PRODUCT_MUTATION } from "../../queries/Mutations";
import { CategoriesData, Product } from "../../types/Types";
import { getErrorMessage } from "../../utils/apolloErrors";
import { colors } from "../../styles/theme";
import { Button } from "../../components/ui/Button";
import {
  Alert,
  Field,
  Form,
  Input,
  Select,
  TextArea,
} from "../../components/ui/Form";
import { PageHeader, Panel } from "../../components/ui/Layout";

type Spec = { key: number; label: string; value: string };

const Container = styled(Panel)`
  max-width: 48rem;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1.25rem;
`;

const SpecsFieldset = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border: none;

  legend {
    margin-bottom: 0.75rem;
    color: ${colors.textSoft};
    font-size: 0.9375rem;
    font-weight: 600;
  }
`;

const SpecRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: 0.75rem;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  border: none;
  border-radius: 0.375rem;
  background: none;
  color: ${colors.textMuted};
  cursor: pointer;

  &:hover {
    color: ${colors.danger};
    background: ${colors.dangerSoft};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
`;

let nextSpecKey = 1;
const newSpec = (): Spec => {
  nextSpecKey += 1;
  return { key: nextSpecKey, label: "", value: "" };
};

const NewProduct = () => {
  const navigate = useNavigate();
  const { data: categoryData } = useQuery<CategoriesData>(CATEGORIES_QUERY);
  const [createProduct, { loading, error }] = useMutation<{
    createProduct: Product;
  }>(CREATE_PRODUCT_MUTATION, {
    // Product lists and category counts are cached across pages; drop them
    // so every page refetches and shows the new product.
    update: (cache) => {
      cache.evict({ id: "ROOT_QUERY", fieldName: "products" });
      cache.evict({ id: "ROOT_QUERY", fieldName: "categories" });
      cache.evict({ id: "ROOT_QUERY", fieldName: "category" });
      cache.gc();
    },
  });

  const [values, setValues] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    stock: "",
    img: "",
    description: "",
  });
  const [specs, setSpecs] = useState<Spec[]>([newSpec()]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const updateSpec = (key: number, field: "label" | "value", value: string) =>
    setSpecs((prev) =>
      prev.map((spec) =>
        spec.key === key ? { ...spec, [field]: value } : spec
      )
    );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await createProduct({
        variables: {
          input: {
            name: values.name.trim(),
            brand: values.brand.trim(),
            category: values.category,
            price: Number(values.price),
            stock: Number(values.stock),
            img: values.img.trim(),
            description: values.description.trim(),
            specs: specs
              .filter((spec) => spec.label.trim() && spec.value.trim())
              .map(({ label, value }) => ({
                label: label.trim(),
                value: value.trim(),
              })),
          },
        },
      });
      if (data) navigate(`/product/${data.createProduct.slug}`);
    } catch {
      // Shown through `error` below.
    }
  };

  const price = Number(values.price);
  const stock = Number(values.stock);
  const canSubmit =
    values.name.trim() &&
    values.category &&
    values.price !== "" &&
    price >= 0 &&
    values.stock !== "" &&
    Number.isInteger(stock) &&
    stock >= 0;

  return (
    <>
      <PageHeader
        title="New product"
        subtitle="Add a product to the catalog. It appears in the store straight away."
      />
      <Container>
        <Form onSubmit={handleSubmit}>
          {error && (
            <Alert $tone="error" role="alert">
              {getErrorMessage(error)}
            </Alert>
          )}
          <Row>
            <Field label="Name" htmlFor="product-name">
              <Input
                id="product-name"
                name="name"
                value={values.name}
                onChange={handleChange}
                required
              />
            </Field>
            <Field label="Brand" htmlFor="product-brand">
              <Input
                id="product-brand"
                name="brand"
                value={values.brand}
                onChange={handleChange}
              />
            </Field>
          </Row>
          <Row>
            <Field label="Category" htmlFor="product-category">
              <Select
                id="product-category"
                name="category"
                value={values.category}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Choose a category
                </option>
                {categoryData?.categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Price (₦)" htmlFor="product-price">
              <Input
                id="product-price"
                name="price"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={values.price}
                onChange={handleChange}
                required
              />
            </Field>
            <Field label="Stock" htmlFor="product-stock">
              <Input
                id="product-stock"
                name="stock"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={values.stock}
                onChange={handleChange}
                required
              />
            </Field>
          </Row>
          <Field
            label="Image URL"
            htmlFor="product-img"
            hint="An absolute URL or a path such as /images/products/my-product.png"
          >
            <Input
              id="product-img"
              name="img"
              value={values.img}
              onChange={handleChange}
              aria-describedby="product-img-hint"
            />
          </Field>
          <Field label="Description" htmlFor="product-description">
            <TextArea
              id="product-description"
              name="description"
              value={values.description}
              onChange={handleChange}
              maxLength={2000}
            />
          </Field>
          <SpecsFieldset>
            <legend>Specifications</legend>
            {specs.map((spec, index) => (
              <SpecRow key={spec.key}>
                <Input
                  aria-label={`Specification ${index + 1} name`}
                  placeholder="e.g. Weight"
                  value={spec.label}
                  onChange={(e) =>
                    updateSpec(spec.key, "label", e.target.value)
                  }
                />
                <Input
                  aria-label={`Specification ${index + 1} value`}
                  placeholder="e.g. 99 g"
                  value={spec.value}
                  onChange={(e) =>
                    updateSpec(spec.key, "value", e.target.value)
                  }
                />
                <IconButton
                  type="button"
                  aria-label={`Remove specification ${index + 1}`}
                  onClick={() =>
                    setSpecs((prev) => prev.filter((s) => s.key !== spec.key))
                  }
                >
                  <FiTrash2 aria-hidden />
                </IconButton>
              </SpecRow>
            ))}
            <div>
              <Button
                $variant="secondary"
                $size="sm"
                onClick={() => setSpecs((prev) => [...prev, newSpec()])}
              >
                <FiPlus aria-hidden /> Add specification
              </Button>
            </div>
          </SpecsFieldset>
          <Actions>
            <Button type="submit" disabled={!canSubmit || loading}>
              {loading ? "Creating…" : "Create product"}
            </Button>
            <Button $variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </Actions>
        </Form>
      </Container>
    </>
  );
};

export default NewProduct;
