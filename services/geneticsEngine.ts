
import { Lineage, ParentDetails, GeneticProfile, BreedTrait } from '../types';
import { BREED_TRAIT_DATABASE } from '../constants';

export const calculateConfidence = (sire: ParentDetails, dam: ParentDetails): number => {
    let score = 0;
    // Base points for knowing the type
    if (sire.type !== 'UNKNOWN') score += 40;
    if (dam.type !== 'UNKNOWN') score += 40;
    
    // Bonus for Purebred specifics
    if (sire.type === 'PUREBRED') score += 10;
    if (dam.type === 'PUREBRED') score += 10;

    // If Unknown but visual guess
    if (sire.type === 'UNKNOWN' && sire.visualGuess) score += 20;
    if (dam.type === 'UNKNOWN' && dam.visualGuess) score += 20;

    return Math.min(score, 100);
};

export const analyzeLineage = (lineage: Lineage): GeneticProfile => {
    const { sire, dam } = lineage;
    
    const sireBreedKey = sire.type === 'PUREBRED' ? sire.breedName : sire.visualGuess;
    const damBreedKey = dam.type === 'PUREBRED' ? dam.breedName : dam.visualGuess;

    // Get Data from DB (Mock lookup by simple string match)
    const getTrait = (name?: string): BreedTrait | undefined => {
        if (!name) return undefined;
        return Object.values(BREED_TRAIT_DATABASE).find(b => b.breed.includes(name) || name.includes(b.breed));
    };

    const sireTrait = getTrait(sireBreedKey);
    const damTrait = getTrait(damBreedKey);

    const profile: GeneticProfile = {
        predictedHealth: [],
        predictedBehavior: [],
        carePlan: [],
        productMatches: []
    };

    const addHealth = (breed: string, risks: string[]) => {
        risks.forEach(r => {
            profile.predictedHealth.push({ 
                risk: r, 
                advice: `Common in ${breed} lineage. Consult vet for early screening.` 
            });
        });
    };

    const addBehavior = (breed: string, traits: string[]) => {
        traits.forEach(t => {
            profile.predictedBehavior.push({
                trait: t,
                advice: `From ${breed} side: Expect ${t.toLowerCase()} tendencies.`
            });
        });
    };

    if (sireTrait) {
        addHealth(sireTrait.breed, sireTrait.healthRisks);
        addBehavior(sireTrait.breed, sireTrait.behavioralTraits);
        profile.carePlan.push(...sireTrait.careTips);
        profile.productMatches.push(...sireTrait.recommendedProducts);
    }

    if (damTrait) {
        addHealth(damTrait.breed, damTrait.healthRisks);
        addBehavior(damTrait.breed, damTrait.behavioralTraits);
        profile.carePlan.push(...damTrait.careTips);
        profile.productMatches.push(...damTrait.recommendedProducts);
    }

    // De-duplicate
    profile.carePlan = [...new Set(profile.carePlan)];
    profile.productMatches = [...new Set(profile.productMatches)];

    return profile;
};
