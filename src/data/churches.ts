export interface ChurchContact {
  label?: string;
  phone: string;
  whatsappLink: string;
}

export interface Church {
  id: string;
  name: string;
  isCentral: boolean;
  pastorTitle: string;
  pastor: string;
  address: string;
  mapLink?: string;
  contacts: ChurchContact[];
}

export const churches: Church[] = [
  {
    id: 'benfica',
    name: 'Christ Embassy Benfica',
    isCentral: true,
    pastorTitle: 'Estimado pastor',
    pastor: 'Charles Ocorodudu',
    address: 'Rua do Mercado Kifica, antes da Escola Internacional do Canadá.',
    mapLink: 'https://share.google/jKycrONe3Qw325ZAa',
    contacts: []
  },
  {
    id: 'camama',
    name: 'Christ Embassy Camama',
    isCentral: false,
    pastorTitle: 'Estimado pastor',
    pastor: 'Hélder Barros',
    address: 'Em frente à esquadra da polícia, junto ao CINFU, na Rua dos Cajueiros.',
    mapLink: 'https://maps.app.goo.gl/B3yN37twtPjBtutf8',
    contacts: [
      { phone: '+244 945 798 518', whatsappLink: 'https://wa.me/244945798518' }
    ]
  },
  {
    id: 'zango',
    name: 'Christ Embassy Zango',
    isCentral: false,
    pastorTitle: 'Pastora',
    pastor: 'Emília Mufundo',
    address: 'Zango 4, junto à Padaria Bom Pão.',
    contacts: [
      { label: 'Contacto 1', phone: '+244 948 458 924', whatsappLink: 'https://wa.me/244948458924' },
      { label: 'Contacto 2', phone: '+244 956 270 904', whatsappLink: 'https://wa.me/244956270904' }
    ]
  },
  {
    id: 'cassenda',
    name: 'Christ Embassy Cassenda',
    isCentral: false,
    pastorTitle: 'Pastor',
    pastor: 'Oscar Weshuro',
    address: 'Em breve.',
    contacts: []
  },
  {
    id: 'lubango1',
    name: 'Christ Embassy Lubango 1',
    isCentral: false,
    pastorTitle: 'Pastor',
    pastor: 'Lino Tiago',
    address: 'Em breve.',
    contacts: []
  },
  {
    id: 'lubango2',
    name: 'Christ Embassy Lubango 2',
    isCentral: false,
    pastorTitle: 'Pastor',
    pastor: 'Elias',
    address: 'Em breve.',
    contacts: []
  },
  {
    id: 'cunene-sede',
    name: 'Christ Embassy Cunene — Sede',
    isCentral: false,
    pastorTitle: 'Pastor',
    pastor: 'André Tiago',
    address: 'Em breve.',
    contacts: []
  },
  {
    id: 'cunene-castilhos',
    name: 'Christ Embassy Cunene — Castilhos',
    isCentral: false,
    pastorTitle: 'Pastora',
    pastor: 'Esmeralda',
    address: 'Em breve.',
    contacts: []
  },
  {
    id: 'cabinda',
    name: 'Christ Embassy Cabinda',
    isCentral: false,
    pastorTitle: 'Pastor',
    pastor: 'João Gime',
    address: 'Em breve.',
    contacts: []
  },
  {
    id: 'namibe',
    name: 'Christ Embassy Namibe',
    isCentral: false,
    pastorTitle: 'Pastor',
    pastor: 'Joysilim',
    address: 'Em breve.',
    contacts: []
  },
  {
    id: 'huambo',
    name: 'Christ Embassy Huambo',
    isCentral: false,
    pastorTitle: 'Pastor',
    pastor: 'Alexandre',
    address: 'Em breve.',
    contacts: []
  }
];

export const getWhatsappLink = (phone: string, churchName: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  const message = encodeURIComponent(`Olá! Gostaria de obter informações sobre a ${churchName}.`);
  return `https://wa.me/${cleanPhone}?text=${message}`;
};
