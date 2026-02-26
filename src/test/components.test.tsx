import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "../components/common/EmptyState";
import { Modal } from "../components/common/Modal";
import ToastContainer from "../components/common/ToastContainer";
import {
  useToastStore,
  useHubStore,
  useOrderStore,
  useAllocationStore,
  useDriverStore,
  useVehicleStore,
  useGPSStore,
} from "../store";

// ─── EmptyState Component ────────────────────────────────────────

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="No Data" description="Nothing to show here." />);
    expect(screen.getByText("No Data")).toBeInTheDocument();
    expect(screen.getByText("Nothing to show here.")).toBeInTheDocument();
  });

  it("renders with message prop (alias)", () => {
    render(<EmptyState title="Empty" message="Try again later." />);
    expect(screen.getByText("Empty")).toBeInTheDocument();
    expect(screen.getByText("Try again later.")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(
      <EmptyState
        title="No Data"
        icon={<span data-testid="test-icon">📦</span>}
      />,
    );
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(<EmptyState title="Empty" action={<button>Add Item</button>} />);
    expect(screen.getByText("Add Item")).toBeInTheDocument();
  });
});

// ─── Modal Component ─────────────────────────────────────────────

describe("Modal", () => {
  it("renders when isOpen is true", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>,
    );
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Hidden Modal">
        <p>Hidden content</p>
      </Modal>,
    );
    expect(screen.queryByText("Hidden Modal")).not.toBeInTheDocument();
  });

  it("calls onClose when X button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Closable">
        <p>Content</p>
      </Modal>,
    );
    fireEvent.click(screen.getByLabelText("Close modal"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Escapable">
        <p>Content</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders confirm button with onConfirm", () => {
    const onConfirm = vi.fn();
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        onConfirm={onConfirm}
        confirmLabel="Save"
        title="Confirm Modal"
      >
        <p>Confirm content</p>
      </Modal>,
    );
    expect(screen.getByText("Save")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Save"));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("renders cancel button alongside confirm", () => {
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="With Cancel"
      >
        <p>Content</p>
      </Modal>,
    );
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("applies danger variant styling", () => {
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        confirmLabel="Delete"
        variant="danger"
        title="Danger"
      >
        <p>Are you sure?</p>
      </Modal>,
    );
    const deleteBtn = screen.getByText("Delete");
    expect(deleteBtn.className).toContain("btn-danger");
  });
});

// ─── ToastContainer ──────────────────────────────────────────────

describe("ToastContainer", () => {
  it("renders toasts from store", () => {
    // Add a toast
    useToastStore
      .getState()
      .addToast({ type: "success", title: "Success!", message: "It worked" });

    render(<ToastContainer />);
    expect(screen.getByText("Success!")).toBeInTheDocument();
  });
});

// ─── Integration: Mock Data Consistency ─────────────────────────

describe("Mock Data Integrity", () => {
  it("all orders reference valid destinations", () => {
    const hubs = useHubStore.getState().hubs;
    const orders = useOrderStore.getState().orders;
    const hubIds = new Set(hubs.map((h: any) => h.id));

    orders.forEach((order: any) => {
      expect(hubIds.has(order.destinationId)).toBe(true);
    });
  });

  it("all allocations reference valid vehicles and drivers", () => {
    const allocations = useAllocationStore.getState().allocations;
    const driverIds = new Set(
      useDriverStore.getState().drivers.map((d: any) => d.id),
    );
    const vehicleIds = new Set(
      useVehicleStore.getState().vehicles.map((v: any) => v.id),
    );

    allocations.forEach((alloc: any) => {
      expect(vehicleIds.has(alloc.vehicleId)).toBe(true);
      expect(driverIds.has(alloc.driverId)).toBe(true);
    });
  });

  it("all GPS updates reference valid drivers", () => {
    const updates = useGPSStore.getState().updates;
    const driverIds = new Set(
      useDriverStore.getState().drivers.map((d: any) => d.id),
    );

    updates.forEach((update: any) => {
      expect(driverIds.has(update.driverId)).toBe(true);
    });
  });
});
