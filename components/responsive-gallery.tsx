'use client';
import {useState} from 'react';
import {ArrowUpRight, ChevronLeft, ChevronRight, Minus, Plus} from 'lucide-react';
import {Dialog, DialogContent, DialogDescription, DialogTitle} from '@/components/ui/dialog';
import type {PropertyRecord} from '@/lib/catalog-schema';

type Props = {name: string; images: PropertyRecord['images']; selectedId: string | null; onClose: () => void};
export function ResponsiveGallery({name, images, selectedId, onClose}: Props) {
  const initial = Math.max(0, images.findIndex(image => image.id === selectedId));
  const [offset, setOffset] = useState(0), [zoom, setZoom] = useState(1);
  const index = (initial + offset + images.length) % images.length;
  const photo = images[index];
  function move(direction: number) {setOffset(n => n + direction); setZoom(1);}
  return <Dialog open={selectedId !== null} onOpenChange={open => {if (!open) onClose();}}><DialogContent className="r-gallery"><DialogTitle>{name}</DialogTitle><DialogDescription>{photo.kind.replaceAll('-', ' ')} · {index + 1} of {images.length}</DialogDescription><div className="r-gallery-viewport"><img src={photo.src} alt={photo.alt} style={{width: `${zoom * 100}%`}}/></div><div className="r-gallery-tools"><div><button className="r-icon" title="Zoom out" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => setZoom(n => Math.max(1, n - .5))}><Minus size={18}/></button><span aria-live="polite">{Math.round(zoom * 100)}%</span><button className="r-icon" title="Zoom in" aria-label="Zoom in" disabled={zoom >= 3} onClick={() => setZoom(n => Math.min(3, n + .5))}><Plus size={18}/></button></div>{images.length > 1 && <div><button className="r-icon" title="Previous image" aria-label="Previous gallery image" onClick={() => move(-1)}><ChevronLeft size={18}/></button><button className="r-icon" title="Next image" aria-label="Next gallery image" onClick={() => move(1)}><ChevronRight size={18}/></button></div>}</div><a className="r-inline-link" href={photo.src} target="_blank" rel="noopener noreferrer">Open original image <ArrowUpRight size={16}/></a>{photo.credit && <p className="r-gallery-credit">{photo.credit}</p>}</DialogContent></Dialog>;
}
