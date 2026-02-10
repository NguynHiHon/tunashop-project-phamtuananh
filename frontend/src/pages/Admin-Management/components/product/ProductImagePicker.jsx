import React, { useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplayIcon from '@mui/icons-material/Replay';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export default function ProductImagePicker({ files, setFiles, imageUrls, setImageUrls, defaultUrl, setDefaultUrl, imageStatuses = {} }) {
  const fileInputRef = useRef(null);

  const handleFiles = useCallback((e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const ts = Date.now();
    const withPreview = selected.map((f, i) => ({ file: f, previewId: `local-${ts}-${i}` }));
    setFiles(prevFiles => [...prevFiles, ...withPreview]);

    const previews = selected.map((f, i) => ({ id: `local-${ts}-${i}`, src: URL.createObjectURL(f), local: true }));
    setImageUrls(prev => {
      if (!defaultUrl && previews.length) setDefaultUrl(previews[0].src);
      return [...prev, ...previews];
    });

    e.target.value = null;
  }, [setFiles, setImageUrls, setDefaultUrl, defaultUrl]);

  const removeImage = useCallback((id) => {
    let removedSrc = null;
    setImageUrls(prev => {
      const toRemove = prev.find(p => p.id === id);
      removedSrc = toRemove?.src;
      if (toRemove && toRemove.local && toRemove.src) {
        try {
          URL.revokeObjectURL(toRemove.src);

        } catch (e) {
          console.error('Error revoking object URL', e);

        }
      }
      const remaining = prev.filter(p => p.id !== id);
      if (defaultUrl === toRemove?.src) setDefaultUrl(remaining.length ? remaining[0].src : null);
      return remaining;
    });

    // Remove matching file by previewId
    setFiles(prev => prev.filter(p => !(p.previewId && p.previewId === id)));
  }, [setImageUrls, setFiles, setDefaultUrl, defaultUrl]);

  // helper to get filename for a preview id
  const nameForPreviewId = (id) => {
    const found = files.find(f => f.previewId === id);
    return found?.file?.name || '';
  };



  return (
    <Box>
      <input ref={fileInputRef} type="file" multiple hidden onChange={handleFiles} />
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
        <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>Chọn tệp</Button>
        <Typography variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>{files.length} tệp đã chọn — Ảnh sẽ được tải lên khi nhấn Lưu.</Typography>
      </Box>

      <Box sx={{ overflowX: 'auto', overflowY: 'hidden', py: 1 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          {imageUrls.map(img => (
            <Box key={img.id} sx={{ width: 160, flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ position: 'relative' }}>
                {img.src ? (
                  <img src={img.src} alt="preview" style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 6, display: 'block' }} />
                ) : (
                  <Box sx={{ width: 160, height: 160, borderRadius: 6, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="caption">No preview</Typography>
                  </Box>
                )}

                {/* Status badge */}
                {imageStatuses[img.id] && (
                  <Box sx={{ position: 'absolute', top: 6, right: 6 }}>
                    <Typography variant="caption" sx={{ bgcolor: imageStatuses[img.id] === 'uploaded' ? 'success.main' : (imageStatuses[img.id] === 'pending' ? 'warning.main' : 'error.main'), color: 'white', px: 0.8, borderRadius: 1 }}>{imageStatuses[img.id]}</Typography>
                  </Box>
                )}

                <Box sx={{ position: 'absolute', top: 6, left: 6, display: 'flex', gap: 1 }}>
                  <FormControlLabel value={img.src} control={<Radio size="small" checked={defaultUrl === img.src} onChange={() => setDefaultUrl(img.src)} />} label="" sx={{ mr: 0, color: 'white' }} />
                  {imageStatuses[img.id] === 'failed' ? (
                    <IconButton size="small" color="primary" onClick={() => retryUpload && retryUpload(img.id)} aria-label="Thử lại"><ReplayIcon fontSize="small" /></IconButton>
                  ) : null}
                  <IconButton size="small" color="error" onClick={() => removeImage(img.id)} aria-label="Xóa ảnh"><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              </Box>

              <Typography variant="caption" noWrap sx={{ maxWidth: 160 }}>{img.local ? nameForPreviewId(img.id) : (img.src ? img.src.split('/').pop() : '')}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}