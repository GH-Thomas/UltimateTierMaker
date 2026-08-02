import { useState } from 'react';
import type {
  ItemCreatePayload,
  ItemSourceCreatePayload,
  TierCreatePayload,
  TierListCreatePayload,
} from '../api/client';
import type { ImageRef, ItemSource, Tier } from '../domain/tierList';
import Modal from './Modal';

function toNullableText(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue === '' ? null : trimmedValue;
}

function toOptionalNumber(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue === '' ? undefined : Number(trimmedValue);
}

function hasSelectedImage(file: File | null) {
  return file !== null;
}

async function resolveImageRef(
  file: File | null,
  onUploadImage: (file: File) => Promise<ImageRef>,
) {
  if (file) {
    return onUploadImage(file);
  }

  return null;
}

function ColorField({
  label,
  value,
  disabled = false,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const pickerValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000';

  return (
    <label className="dialog-field">
      <span className="dialog-label">{label}</span>
      <div className="dialog-color-inputs">
        <input
          className="dialog-color-picker"
          type="color"
          value={pickerValue}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          className="dialog-input"
          type="text"
          placeholder="#000000"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </label>
  );
}

function UploadField({
  label,
  file,
  disabled = false,
  onChange,
}: {
  label: string;
  file: File | null;
  disabled?: boolean;
  onChange: (file: File | null) => void;
}) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    if (disabled) {
      return;
    }

    const droppedFile = event.dataTransfer.files?.[0] ?? null;
    onChange(droppedFile);
  };

  return (
    <label
      className={isDragActive ? 'dialog-field dialog-field-full upload-field upload-field-active' : 'dialog-field dialog-field-full upload-field'}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <span className="dialog-label">{label}</span>
      <input
        className="upload-field-input"
        type="file"
        accept="image/*"
        disabled={disabled}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <span className="dialog-help-text">
        Click to choose an image or drag and drop one here.
      </span>
      {file && <span className="dialog-help-text">Selected file: {file.name}</span>}
    </label>
  );
}

interface CreateTierListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: TierListCreatePayload) => Promise<void>;
  onUploadImage: (file: File) => Promise<ImageRef>;
}

export function CreateTierListDialog({ isOpen, onClose, onSubmit, onUploadImage }: CreateTierListDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('');
  const [tierSpacing, setTierSpacing] = useState('1');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedBackgroundImageFile, setSelectedBackgroundImageFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasBackgroundImageSelection = hasSelectedImage(selectedBackgroundImageFile);

  const handleBackgroundColorChange = (value: string) => {
    setBackgroundColor(value);
    if (value.trim() !== '') {
      setSelectedBackgroundImageFile(null);
    }
  };

  const handleBackgroundImageUploadChange = (file: File | null) => {
    setSelectedBackgroundImageFile(file);
    if (file !== null) {
      setBackgroundColor('');
    }
  };

  const handleImageUploadChange = (file: File | null) => {
    setSelectedImageFile(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const imageRef = await resolveImageRef(selectedImageFile, onUploadImage);
      const backgroundImageRef = await resolveImageRef(selectedBackgroundImageFile, onUploadImage);

      await onSubmit({
        name: name.trim(),
        description: toNullableText(description),
        backgroundColor: toNullableText(backgroundColor),
        tierSpacing: Number(tierSpacing),
        image: imageRef,
        backgroundImage: backgroundImageRef,
      });
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create tier list');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Create Tier List" isOpen={isOpen} onClose={onClose}>
      <form className="dialog-form" onSubmit={handleSubmit}>
        <label className="dialog-field dialog-field-full">
          <span className="dialog-label">Name</span>
          <input className="dialog-input" value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label className="dialog-field dialog-field-full">
          <span className="dialog-label">Description</span>
          <textarea className="dialog-textarea" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
        </label>
        <ColorField label="Background Color" value={backgroundColor} disabled={hasBackgroundImageSelection} onChange={handleBackgroundColorChange} />
        <label className="dialog-field">
          <span className="dialog-label">Tier Spacing</span>
          <input className="dialog-input" type="number" min="0" step="0.1" value={tierSpacing} onChange={(event) => setTierSpacing(event.target.value)} />
        </label>
        <div className="dialog-field dialog-field-full" />
        <UploadField label="Upload Cover Image" file={selectedImageFile} onChange={handleImageUploadChange} />
        <UploadField label="Upload Background Image" file={selectedBackgroundImageFile} disabled={backgroundColor.trim() !== ''} onChange={handleBackgroundImageUploadChange} />
        <p className="dialog-help-text dialog-field-full">Background color and background image are mutually exclusive.</p>
        {submitError && <p className="dialog-error">{submitError}</p>}
        <div className="dialog-actions">
          <button className="dialog-secondary-button" onClick={onClose} type="button">Cancel</button>
          <button className="dialog-primary-button" type="submit" disabled={isSubmitting || name.trim() === ''}>Create Tier List</button>
        </div>
      </form>
    </Modal>
  );
}

interface CreateTierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRank: number;
  onSubmit: (payload: TierCreatePayload) => Promise<void>;
  onUploadImage: (file: File) => Promise<ImageRef>;
}

export function CreateTierDialog({ isOpen, onClose, defaultRank, onSubmit, onUploadImage }: CreateTierDialogProps) {
  const [name, setName] = useState('');
  const [rank, setRank] = useState(String(defaultRank));
  const [order, setOrder] = useState(String(defaultRank));
  const [tierColor, setTierColor] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('');
  const [tierSize, setTierSize] = useState('1');
  const [selectedTierImageFile, setSelectedTierImageFile] = useState<File | null>(null);
  const [selectedBackgroundImageFile, setSelectedBackgroundImageFile] = useState<File | null>(null);
  const [selectedSymbolFile, setSelectedSymbolFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasTierImageSelection = hasSelectedImage(selectedTierImageFile);
  const hasBackgroundImageSelection = hasSelectedImage(selectedBackgroundImageFile);

  const handleTierColorChange = (value: string) => {
    setTierColor(value);
    if (value.trim() !== '') {
      setSelectedTierImageFile(null);
    }
  };

  const handleTierImageUploadChange = (file: File | null) => {
    setSelectedTierImageFile(file);
    if (file !== null) {
      setTierColor('');
    }
  };

  const handleBackgroundColorChange = (value: string) => {
    setBackgroundColor(value);
    if (value.trim() !== '') {
      setSelectedBackgroundImageFile(null);
    }
  };

  const handleBackgroundImageUploadChange = (file: File | null) => {
    setSelectedBackgroundImageFile(file);
    if (file !== null) {
      setBackgroundColor('');
    }
  };

  const handleSymbolUploadChange = (file: File | null) => {
    setSelectedSymbolFile(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const tierImageRef = await resolveImageRef(selectedTierImageFile, onUploadImage);
      const backgroundImageRef = await resolveImageRef(selectedBackgroundImageFile, onUploadImage);
      const tierSymbolRef = await resolveImageRef(selectedSymbolFile, onUploadImage);

      await onSubmit({
        name: name.trim(),
        rank: Number(rank),
        order: Number(order),
        tierColor: toNullableText(tierColor),
        backgroundColor: toNullableText(backgroundColor),
        tierSize: Number(tierSize),
        tierImage: tierImageRef,
        backgroundImage: backgroundImageRef,
        tierSymbol: tierSymbolRef,
      });
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create tier');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Create Tier" isOpen={isOpen} onClose={onClose}>
      <form className="dialog-form" onSubmit={handleSubmit}>
        <label className="dialog-field dialog-field-full">
          <span className="dialog-label">Name</span>
          <input className="dialog-input" value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label className="dialog-field">
          <span className="dialog-label">Rank</span>
          <input className="dialog-input" type="number" value={rank} onChange={(event) => setRank(event.target.value)} />
        </label>
        <label className="dialog-field">
          <span className="dialog-label">Order</span>
          <input className="dialog-input" type="number" value={order} onChange={(event) => setOrder(event.target.value)} />
        </label>
        <ColorField label="Tier Color" value={tierColor} disabled={hasTierImageSelection} onChange={handleTierColorChange} />
        <ColorField label="Background Color" value={backgroundColor} disabled={hasBackgroundImageSelection} onChange={handleBackgroundColorChange} />
        <label className="dialog-field">
          <span className="dialog-label">Tier Size</span>
          <input className="dialog-input" type="number" min="0" step="0.1" value={tierSize} onChange={(event) => setTierSize(event.target.value)} />
        </label>
        <div className="dialog-field dialog-field-full" />
        <UploadField label="Upload Tier Image" file={selectedTierImageFile} disabled={tierColor.trim() !== ''} onChange={handleTierImageUploadChange} />
        <UploadField label="Upload Tier Background Image" file={selectedBackgroundImageFile} disabled={backgroundColor.trim() !== ''} onChange={handleBackgroundImageUploadChange} />
        <UploadField label="Upload Tier Symbol" file={selectedSymbolFile} onChange={handleSymbolUploadChange} />
        <p className="dialog-help-text dialog-field-full">Tier color and tier image are mutually exclusive. Background color and background image are mutually exclusive.</p>
        {submitError && <p className="dialog-error">{submitError}</p>}
        <div className="dialog-actions">
          <button className="dialog-secondary-button" onClick={onClose} type="button">Cancel</button>
          <button className="dialog-primary-button" type="submit" disabled={isSubmitting || name.trim() === ''}>Create Tier</button>
        </div>
      </form>
    </Modal>
  );
}

interface CreateItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tiers: Tier[];
  itemSources: ItemSource[];
  defaultTierId?: string;
  onSubmit: (payload: ItemCreatePayload) => Promise<void>;
  onUploadImage: (file: File) => Promise<ImageRef>;
}

export function CreateItemDialog({ isOpen, onClose, tiers, itemSources, defaultTierId, onSubmit, onUploadImage }: CreateItemDialogProps) {
  const [name, setName] = useState('');
  const [nicknames, setNicknames] = useState('');
  const [description, setDescription] = useState('');
  const [tierId, setTierId] = useState(defaultTierId ?? '');
  const [sourceId, setSourceId] = useState('');
  const [order, setOrder] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedBackgroundImageFile, setSelectedBackgroundImageFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUploadChange = (file: File | null) => {
    setSelectedImageFile(file);
  };

  const handleBackgroundImageUploadChange = (file: File | null) => {
    setSelectedBackgroundImageFile(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const imageRef = await resolveImageRef(selectedImageFile, onUploadImage);
      const backgroundImageRef = await resolveImageRef(selectedBackgroundImageFile, onUploadImage);

      await onSubmit({
        name: name.trim(),
        nicknames: nicknames.split(',').map((value) => value.trim()).filter((value) => value !== ''),
        description: toNullableText(description),
        tierId: tierId === '' ? null : tierId,
        source: sourceId === '' ? null : { id: sourceId },
        order: toOptionalNumber(order),
        image: imageRef,
        backgroundImage: backgroundImageRef,
      });
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Create Item" isOpen={isOpen} onClose={onClose}>
      <form className="dialog-form" onSubmit={handleSubmit}>
        <label className="dialog-field dialog-field-full">
          <span className="dialog-label">Name</span>
          <input className="dialog-input" value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label className="dialog-field dialog-field-full">
          <span className="dialog-label">Nicknames</span>
          <input className="dialog-input" value={nicknames} onChange={(event) => setNicknames(event.target.value)} placeholder="Comma-separated" />
        </label>
        <label className="dialog-field dialog-field-full">
          <span className="dialog-label">Description</span>
          <textarea className="dialog-textarea" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
        </label>
        <label className="dialog-field">
          <span className="dialog-label">Tier</span>
          <select className="dialog-input" value={tierId} onChange={(event) => setTierId(event.target.value)}>
            <option value="">Unranked</option>
            {tiers.map((tier) => (
              <option key={tier.id} value={tier.id}>{tier.name}</option>
            ))}
          </select>
        </label>
        <label className="dialog-field">
          <span className="dialog-label">Source</span>
          <select className="dialog-input" value={sourceId} onChange={(event) => setSourceId(event.target.value)}>
            <option value="">None</option>
            {itemSources.map((source) => (
              <option key={source.id} value={source.id}>{source.name}</option>
            ))}
          </select>
        </label>
        <label className="dialog-field">
          <span className="dialog-label">Order</span>
          <input className="dialog-input" type="number" value={order} onChange={(event) => setOrder(event.target.value)} />
        </label>
        <div className="dialog-field dialog-field-full" />
        <UploadField label="Upload Item Image" file={selectedImageFile} onChange={handleImageUploadChange} />
        <UploadField label="Upload Item Background Image" file={selectedBackgroundImageFile} onChange={handleBackgroundImageUploadChange} />
        {submitError && <p className="dialog-error">{submitError}</p>}
        <div className="dialog-actions">
          <button className="dialog-secondary-button" onClick={onClose} type="button">Cancel</button>
          <button className="dialog-primary-button" type="submit" disabled={isSubmitting || name.trim() === ''}>Create Item</button>
        </div>
      </form>
    </Modal>
  );
}

interface CreateItemSourceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ItemSourceCreatePayload) => Promise<void>;
  onUploadImage: (file: File) => Promise<ImageRef>;
}

export function CreateItemSourceDialog({ isOpen, onClose, onSubmit, onUploadImage }: CreateItemSourceDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUploadChange = (file: File | null) => {
    setSelectedImageFile(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const imageRef = await resolveImageRef(selectedImageFile, onUploadImage);

      await onSubmit({
        name: name.trim(),
        description: toNullableText(description),
        link: toNullableText(link),
        image: imageRef,
      });
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create item source');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Create Item Source" isOpen={isOpen} onClose={onClose}>
      <form className="dialog-form" onSubmit={handleSubmit}>
        <label className="dialog-field dialog-field-full">
          <span className="dialog-label">Name</span>
          <input className="dialog-input" value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label className="dialog-field dialog-field-full">
          <span className="dialog-label">Description</span>
          <textarea className="dialog-textarea" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
        </label>
        <label className="dialog-field dialog-field-full">
          <span className="dialog-label">Link</span>
          <input className="dialog-input" type="url" value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://example.com" />
        </label>
        <UploadField label="Upload Source Image" file={selectedImageFile} onChange={handleImageUploadChange} />
        {submitError && <p className="dialog-error">{submitError}</p>}
        <div className="dialog-actions">
          <button className="dialog-secondary-button" onClick={onClose} type="button">Cancel</button>
          <button className="dialog-primary-button" type="submit" disabled={isSubmitting || name.trim() === ''}>Create Item Source</button>
        </div>
      </form>
    </Modal>
  );
}