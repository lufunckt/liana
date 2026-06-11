import { seedDatabase } from './seed_firebase';

console.log('Iniciando o povoamento do banco de dados...');
seedDatabase()
  .then(() => {
    console.log('✅ Banco de dados populado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro ao popular o banco de dados:', error);
    process.exit(1);
  });
