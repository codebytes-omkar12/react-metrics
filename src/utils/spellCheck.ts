// @ts-ignore
import nspell from 'nspell';



let spell:nspell | null= null;

export const initializeSpellChecker = async (): Promise<void> => {
    const dictionaryModule = await import('dictionary-en');
    const dict = dictionaryModule.default || dictionaryModule;
    spell = nspell(dict);
};

export const correctSpelling = (text:string):string => {
    if(!spell) return text;

    const words = text.split(/\b/);
    const corrected = words.map((word)=>{
        if (spell!.correct(word)) return word;
        const suggestions = spell!.suggest(word);
        return suggestions[0] || word;
    })
    return corrected.join('');
}

