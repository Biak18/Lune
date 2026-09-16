import { formatStatus } from "@/features/orders/utils/formatStatus";

describe("formatStatus", () => {
  it("humanizes snake_case order states", () => {
    expect(formatStatus("out_for_delivery")).toBe("Out For Delivery");
    expect(formatStatus("pending")).toBe("Pending");
    expect(formatStatus("cancelled")).toBe("Cancelled");
  });
});
