import React, { useState } from 'react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';

const VideoBandwidthCalculator = () => {
  const [resolution, setResolution] = useState('1080p');
  const [frameRate, setFrameRate] = useState(30);
  const [bitDepth, setBitDepth] = useState(8);
  const [bandwidth, setBandwidth] = useState(null);

  const calculateBandwidth = () => {
    const resolutionMap = {
      '720p': 1280 * 720,
      '1080p': 1920 * 1080,
      '4K': 3840 * 2160,
    };

    const pixels = resolutionMap[resolution] || 1920 * 1080;
    const bandwidthMbps = (pixels * frameRate * bitDepth) / 1_000_000;
    setBandwidth(bandwidthMbps.toFixed(2));
  };

  return (
    <div className="p-4 items-center">
      <h2 className="text-xl font-bold mb-4">Video Bandwidth Calculator</h2>
      <div className="mb-4">
        <label className="block mb-2">Resolution</label>
        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
          <option value="4K">4K</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Frame Rate (fps)</label>
        <Input
          type="number"
          value={frameRate}
          onChange={(e) => setFrameRate(Number(e.target.value))}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Bit Depth</label>
        <Input
          type="number"
          value={bitDepth}
          onChange={(e) => setBitDepth(Number(e.target.value))}
        />
      </div>
      <Button onClick={calculateBandwidth} className="w-30 shadow-lg">Calculate</Button>
      {bandwidth && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Estimated Bandwidth</h3>
          <p>{bandwidth} Mbps</p>
        </div>
      )}
    </div>
  );
};

export default VideoBandwidthCalculator;