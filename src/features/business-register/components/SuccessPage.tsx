import { motion } from 'framer-motion';
import { Button } from './ui';

export function SuccessPage({ onHome }: { onHome: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto text-center px-4 py-16"
    >
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-navy to-crimson text-white text-3xl shadow-xl">
        ✓
      </div>
      <h1 className="text-3xl font-extrabold text-navy font-display tracking-tight">Merci !</h1>
      <p className="mt-4 text-slate-600 leading-relaxed">
        Votre demande a bien été reçue.
        <br />
        Notre équipe vérifiera les informations avant la publication de votre entreprise.
        <br />
        Vous serez contacté si des informations complémentaires sont nécessaires.
      </p>
      <p className="mt-3 text-sm text-slate-400">
        Your listing status is <span className="font-bold text-amber-600">pending</span> until an
        administrator approves it.
      </p>
      <Button variant="crimson" className="mt-8 px-8" onClick={onHome}>
        Retour à l’accueil
      </Button>
    </motion.div>
  );
}
