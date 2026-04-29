import { Org } from '../types/org';
/**
 * Organization Service - CRUD operations for organizations.
 */
export declare function createOrg(data: {
    name: string;
}): Promise<Org>;
export declare function getOrgs(): Promise<Org[]>;
export declare function getOrgById(id: string): Promise<Org | null>;
export declare function updateOrg(id: string, data: Partial<Org>): Promise<Org | null>;
export declare function deleteOrg(id: string): Promise<boolean>;
//# sourceMappingURL=org.service.d.ts.map