import { ArtifactPatch } from "@epios/domain";
import { ArtifactRepositoryPort } from "@epios/ports";

export interface ListArtifactPatchesRequest {
  artifactId?: string;
  missionId?: string;
}

export class ListArtifactPatchesUseCase {
  constructor(private artifactRepo: ArtifactRepositoryPort) {}

  async execute(request: ListArtifactPatchesRequest): Promise<ArtifactPatch[]> {
    if (request.artifactId) {
      return this.artifactRepo.findPatchesByArtifactId(request.artifactId);
    }
    if (request.missionId) {
      // Note: We might need findPatchesByMissionId in the port,
      // but for now let's assume artifactId is the primary way or we fetch all artifacts for mission first.
      // Actually, let's add findPatchesByMissionId to the port if it's missing or use artifacts.
      const artifacts = await this.artifactRepo.findArtifactsByMissionId(
        request.missionId,
      );
      const allPatches: ArtifactPatch[] = [];
      for (const art of artifacts) {
        const patches = await this.artifactRepo.findPatchesByArtifactId(art.id);
        allPatches.push(...patches);
      }
      return allPatches;
    }
    return [];
  }
}
