<script>
  export let value = '';
  export let label = 'Deskripsi';
  let editor;

  function command(name, argument = null) {
    editor.focus();
    document.execCommand(name, false, argument);
    value = editor.innerHTML;
  }

  function addLink() {
    const url = prompt('Masukkan tautan HTTPS:');
    if (url?.startsWith('https://')) command('createLink', url);
  }

  function addTable() {
    command('insertHTML', '<table><thead><tr><th>Judul 1</th><th>Judul 2</th></tr></thead><tbody><tr><td>Isi</td><td>Isi</td></tr></tbody></table><p><br></p>');
  }

  function plainPaste(event) {
    event.preventDefault();
    command('insertText', event.clipboardData.getData('text/plain'));
  }
</script>

<div class="rich-editor">
  <span class="rich-editor-label">{label}</span>
  <div class="rich-toolbar" role="toolbar" aria-label="Format teks">
    <button type="button" title="Tebal" on:click={() => command('bold')}><b>B</b></button>
    <button type="button" title="Miring" on:click={() => command('italic')}><i>I</i></button>
    <button type="button" title="Garis bawah" on:click={() => command('underline')}><u>U</u></button>
    <button type="button" title="Judul" on:click={() => command('formatBlock', 'h3')}>Judul</button>
    <button type="button" title="Daftar" on:click={() => command('insertUnorderedList')}>Daftar</button>
    <button type="button" title="Tautan" on:click={addLink}>Tautan</button>
    <button type="button" title="Tabel" on:click={addTable}>Tabel</button>
    <button type="button" title="Hapus format" on:click={() => command('removeFormat')}>Bersihkan</button>
  </div>
  <div class="rich-editor-area" bind:this={editor} contenteditable="true" role="textbox" aria-multiline="true" aria-label={label} on:input={() => value = editor.innerHTML} on:paste={plainPaste}>{@html value}</div>
  <small>Gunakan toolbar untuk mengatur teks. Konten berbahaya otomatis dibersihkan saat disimpan.</small>
</div>
