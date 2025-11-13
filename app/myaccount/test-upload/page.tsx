// app/myaccount/test-upload/page.tsx
"use client";

import { useActionState } from "react";
import {
  addPaymentProofAction,
  type InvoiceState,
} from "@/actions/invoice-actions"; // Pastikan path ini benar

const initialState: InvoiceState = { status: "info", message: "" };

export default function TestUploadPage() {
  const [state, dispatch] = useActionState(addPaymentProofAction, initialState);

  // Ganti 'ID_INVOICE_CUSTOMER_UNPAID' dengan ID invoice
  // milik customer yang sedang login dan statusnya UNPAID
  // (Contoh: 'cmhxrcja2000165zxtn0r9dhs')
  const INVOICE_ID_TES = "cmhxrcja2000165zxtn0r9dhs";

  return (
    <div style={{ padding: "40px" }}>
      <h1>Test Upload Khusus Customer</h1>
      <p>Menguji upload untuk invoice ID: {INVOICE_ID_TES}</p>

      <form action={dispatch} className="space-y-3">
        {/* Input tersembunyi untuk ID invoice */}
        <input type="hidden" name="id" value={INVOICE_ID_TES} />

        <div>
          <label htmlFor="file" style={{ display: "block", margin: "10px 0" }}>
            Pilih File (JPG/PNG):
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept="image/png, image/jpeg, image/webp"
            required
          />
        </div>

        {state?.errors?.file && (
          <p style={{ color: "red" }}>{state.errors.file[0]}</p>
        )}

        <button
          type="submit"
          style={{
            padding: "10px",
            background: "blue",
            color: "white",
            border: "none",
          }}
        >
          Test Upload
        </button>

        {state?.message && (
          <p style={{ color: state.status === "error" ? "red" : "green" }}>
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}
