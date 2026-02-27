import { listColumnStyles } from './styles';

type ListMetaProps = {
  createdAt: string | Date;
};

function ListMeta({ createdAt }: ListMetaProps) {
  const createdLabel = new Date(createdAt).toLocaleString('en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <>
      <p style={listColumnStyles.metaSecondary}>Created on {createdLabel}</p>
    </>
  );
}

export default ListMeta;
