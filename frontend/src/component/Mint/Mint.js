import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

const Mint = ({ uploadToPinata, mintNFT }) => {
    const [file, setFile] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isMinting, setIsMinting] = useState(false);

    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'image/*': [] },
        onDrop: (acceptedFiles) => {
            const previewFile = Object.assign(acceptedFiles[0], {
                preview: URL.createObjectURL(acceptedFiles[0]),
            });
            setFile(previewFile);
        },
    });

    const clearImage = () => {
        setFile(null);
    };

    const handleMint = async () => {
        if (!file || !name || !description) {
            alert('Please complete all fields');
            return;
        }

        setIsMinting(true);

        try {
            const IpfsHash = await uploadToPinata(file, name, description);
            mintNFT(IpfsHash);
            clearImage();
        } catch (e) {
            console.log(e);
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white pt-15">
            <h2 className="text-3xl font-bold mb-6">Mint Your NFT</h2>
            <div 
                {...getRootProps({ className: 'border-2 border-dashed border-purple-500 rounded-lg p-6 mb-4 text-center' })}>
                <input {...getInputProps()} />
                {file ? (
                    <div>
                        <img src={file.preview} alt="Preview" className="max-w-[250px] rounded-lg" />
                    </div>
                ) : (
                    <a className="text-purple-500">Drag & drop an image file, or click to select one</a>
                )}
            </div>
            {file && (
                <button
                    onClick={clearImage}
                    className="bg-red-500 text-white rounded-lg px-4 py-2 mb-4">
                    Clear
                </button>
            )}

            <div className="w-full max-w-md mb-4">
                <label className="block mb-2">Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter NFT Name"
                    className="w-full p-2 rounded-lg border border-gray-300 text-black"
                />
            </div>

            <div className="w-full max-w-md mb-4">
                <label className="block mb-2">Description:</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter NFT Description"
                    className="w-full p-2 rounded-lg border border-gray-300 text-black"
                />
            </div>
            <button
                onClick={handleMint}
                disabled={isMinting}
                className={`bg-purple-500 text-white rounded-lg px-4 py-2 ${isMinting ? 'cursor-not-allowed' : 'hover:bg-purple-600'}`}
            >
                {isMinting ? 'Minting...' : 'Mint NFT'}
            </button>
        </div>
    );
};

export default Mint;
