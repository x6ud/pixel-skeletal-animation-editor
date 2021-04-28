const download = document.createElement('a');
download.style.display = 'none';
document.body.appendChild(download);

export function saveAs(data: Uint8Array, filename: string) {
    const blob = new Blob([data], {type: 'octet/stream'});
    const url = URL.createObjectURL(blob);
    download.href = url;
    download.download = filename;
    download.click();
    URL.revokeObjectURL(url);
}

export function readFile(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = (e: ProgressEvent) => {
            try {
                resolve(new Uint8Array((e.target as any).result));
            } catch (err) {
                reject(err);
            }
        };
        fileReader.onabort = fileReader.onerror = (e) => {
            reject((e.target as any).error);
        };
        fileReader.readAsArrayBuffer(file);
    });
}
