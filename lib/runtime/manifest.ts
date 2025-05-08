import { Runtime } from './extensionizer';

export function getManifestVersion() {
  return Runtime.runtime.getManifest().manifest_version;
}
