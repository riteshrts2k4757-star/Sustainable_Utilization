import { useState } from "react";
import SourceCards from "../components/SourceCards";
import ManualInputModal from "../components/ManualInputModal";

export default function SourcesPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <SourceCards onOpenModal={() => setModalOpen(true)} />
      <ManualInputModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
