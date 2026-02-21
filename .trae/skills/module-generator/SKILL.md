---
name: "module-generator"
description: "Generates new CRUD module (service, controller, routes, types). Invoke when user wants to create new feature module."
---

# Module Generator

This skill generates a complete CRUD module for a new entity.

## When to Invoke

- User asks "create module", "generate CRUD", "add new feature"
- User wants to create new entity (e.g., "product", "category", "order")

## Input

Ask user for:

1. **Module name** (singular, e.g., "product", "category")
2. **Fields** (list of fields with types)

## Generated Files

For module "product":

### 1. Types: `src/types/product.ts`

```typescript
export interface IProductDto {
  name: string;
  description?: string;
  price: number;
  // ... other fields
}

export interface IUpdateProductDto extends Partial<IProductDto> {}

export interface ProductQuery extends PaginationParams {
  search?: string;
  status?: string;
}

export type ProductProfile = Product;
export type ProductPaginatedResponse = PaginatedResponse<ProductProfile>;
```

### 2. Service: `src/services/product.service.ts`

```typescript
const PRODUCT_SELECT_FIELDS = {
  id: true,
  name: true,
  description: true,
  price: true,
  created_at: true,
  updated_at: true,
  // ... add more fields
} as const;

export const createProduct = async (
  data: IProductDto,
): Promise<ProductProfile> => {
  try {
    const product = await prisma.product.create({
      data,
      select: PRODUCT_SELECT_FIELDS,
    });
    return product;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// export other CRUD functions: getAllProducts, getProductById, updateProduct, deleteProduct
```

### 3. Controller: `src/controllers/product.controller.ts`

```typescript
export const createProductHandler = async (
  request: FastifyRequest<{ Body: IProductDto }>,
  reply: FastifyReply,
): Promise<void> => {
  const data = await productService.createProduct(request.body);
  return reply.send(success(res, data, "Product created successfully"));
};

// export other handlers
```

### 4. Routes: `src/routes/product.routes.ts`

```typescript
export const productRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/", createProductHandler);
  fastify.get("/", getAllProductsHandler);
  fastify.get("/:id", getProductByIdHandler);
  fastify.put("/:id", updateProductHandler);
  fastify.delete("/:id", deleteProductHandler);
};
```

## Naming Conventions

| Type               | Convention                  | Example                    |
| ------------------ | --------------------------- | -------------------------- |
| Interface          | `I<Entity>Dto`              | `IProductDto`              |
| Update DTO         | `IUpdate<Entity>Dto`        | `IUpdateProductDto`        |
| Query              | `<Entity>Query`             | `ProductQuery`             |
| Profile            | `<Entity>Profile`           | `ProductProfile`           |
| Paginated Response | `<Entity>PaginatedResponse` | `ProductPaginatedResponse` |
| Service            | `<entity>Service`           | `productService`           |
| Handler            | `<action>Handler`           | `createProductHandler`     |
| SELECT_FIELDS      | `<ENTITY>_SELECT_FIELDS`    | `PRODUCT_SELECT_FIELDS`    |

## Steps

1. Ask user for module name and fields
2. Create types file
3. Create service file with SELECT_FIELDS
4. Create controller file
5. Create routes file
6. Register routes in server.ts (if needed)
7. Run typecheck to verify

## Dependencies

After creating module, update:

- Export in `src/services/index.ts` (if exists)
- Export in `src/controllers/index.ts` (if exists)
- Export in `src/routes/index.ts` (if exists)
