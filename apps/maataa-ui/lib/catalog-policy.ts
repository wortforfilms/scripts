export type PublishStatus = "DRAFT" | "REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";
export type UserRole = "USER" | "REVIEWER" | "ADMIN" | "SUPER_ADMIN";

export type SkuState = {
  publishStatus: PublishStatus;
  isActive: boolean;
};

export function createDraftSkuState(): SkuState {
  return { publishStatus: "DRAFT", isActive: false };
}

export function submitSkuForReview(sku: SkuState): SkuState {
  if (sku.publishStatus !== "DRAFT") throw new Error("Only DRAFT SKUs can be submitted for review");
  return { ...sku, publishStatus: "REVIEW", isActive: false };
}

export function approveSku(sku: SkuState): SkuState {
  if (sku.publishStatus !== "REVIEW") throw new Error("Only REVIEW SKUs can be approved");
  return { ...sku, publishStatus: "APPROVED", isActive: false };
}

export function publishSku(sku: SkuState): SkuState {
  if (sku.publishStatus !== "APPROVED") throw new Error("Only APPROVED SKUs can be published");
  return { publishStatus: "PUBLISHED", isActive: true };
}

export function archiveSku(sku: SkuState): SkuState {
  return { ...sku, publishStatus: "ARCHIVED", isActive: false };
}

export function canApproveSku(role: UserRole) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function canReviewCatalog(role: UserRole) {
  return role === "REVIEWER" || canApproveSku(role);
}

export function isPublicSku(sku: SkuState) {
  return sku.publishStatus === "PUBLISHED" && sku.isActive;
}
