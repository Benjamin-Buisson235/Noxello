import { listColumnStyles } from './styles';

type ListMetaProps = {
  position: number;
  createdAt: string | Date;
};

function ListMeta({ position, createdAt }: ListMetaProps) {
  const createdLabel = new Date(createdAt).toLocaleString('en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <>
      <p style={listColumnStyles.meta}>Position: {position}</p>
      <p style={listColumnStyles.metaSecondary}>Created on {createdLabel}</p>
    </>
  );
}

export default ListMeta;
